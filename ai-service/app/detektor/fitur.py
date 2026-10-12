import numpy as np
import torch
from PIL import Image
from transformers import AutoModel, OwlViTForObjectDetection, OwlViTProcessor

from app.detektor.kepala import FiturFoto

MODEL_GLOBAL = "facebook/dinov2-base"
MODEL_REGIONAL = "google/owlvit-base-patch32"
KUERI_TOILET = ["a toilet with grab bars", "a wheelchair accessible toilet"]
SISI_GLOBAL = 224
RATA_IMAGENET = torch.tensor([0.485, 0.456, 0.406]).view(3, 1, 1)
SIMPANGAN_IMAGENET = torch.tensor([0.229, 0.224, 0.225]).view(3, 1, 1)


class PengekstrakFitur:
    def __init__(self) -> None:
        self.model_global = AutoModel.from_pretrained(MODEL_GLOBAL).eval()
        self.prosesor_regional = OwlViTProcessor.from_pretrained(MODEL_REGIONAL)
        self.model_regional = OwlViTForObjectDetection.from_pretrained(MODEL_REGIONAL).eval()
        self.kueri_toilet = self._siapkan_kueri_toilet()

    @torch.no_grad()
    def _siapkan_kueri_toilet(self) -> torch.Tensor:
        masukan = self.prosesor_regional(
            text=[KUERI_TOILET], images=Image.new("RGB", (64, 64)), return_tensors="pt"
        )
        return self.model_regional(**masukan).text_embeds

    @torch.no_grad()
    def ekstrak(self, gambar: Image.Image) -> FiturFoto:
        return FiturFoto(
            fitur_global=self._fitur_global(gambar),
            **self._fitur_bagian(gambar),
        )

    def _fitur_global(self, gambar: Image.Image) -> np.ndarray:
        kecil = gambar.resize((SISI_GLOBAL, SISI_GLOBAL), Image.BICUBIC)
        piksel = torch.from_numpy(np.asarray(kecil, dtype=np.float32) / 255).permute(2, 0, 1)
        piksel = ((piksel - RATA_IMAGENET) / SIMPANGAN_IMAGENET)[None]
        token = self.model_global(pixel_values=piksel).last_hidden_state[0]
        return torch.cat([token[0], token[1:].mean(0)]).numpy()

    def _fitur_bagian(self, gambar: Image.Image) -> dict[str, np.ndarray]:
        piksel = self.prosesor_regional(images=gambar, return_tensors="pt").pixel_values
        peta = self.model_regional.image_embedder(pixel_values=piksel)[0]
        jumlah, tinggi, lebar, kanal = peta.shape
        fitur = peta.reshape(jumlah, tinggi * lebar, kanal)
        kotak = self.model_regional.box_predictor(fitur, peta)[0]
        logit_toilet, embedding = self.model_regional.class_predictor(
            fitur,
            self.kueri_toilet,
            torch.ones(self.kueri_toilet.shape[:2], dtype=torch.bool),
        )
        pusat_x, pusat_y, lebar_kotak, tinggi_kotak = kotak.unbind(-1)
        sudut = torch.stack(
            [
                pusat_x - lebar_kotak / 2,
                pusat_y - tinggi_kotak / 2,
                pusat_x + lebar_kotak / 2,
                pusat_y + tinggi_kotak / 2,
            ],
            -1,
        ).clamp(0, 1)
        return {
            "fitur_bagian": embedding[0].numpy(),
            "kotak_bagian": sudut.numpy(),
            "skor_toilet_bagian": logit_toilet[0].max(-1).values.numpy(),
        }
