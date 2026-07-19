"""
Generates FlowSync favicon assets matching the site's lime (#84cc16) on
near-black (#09090b) identity, mirroring the sidebar logo mark:
a rounded square, lime background, bold black "F".
"""
from PIL import Image, ImageDraw, ImageFont

LIME = (132, 204, 22, 255)       # --color-primary #84cc16
INK = (9, 9, 11, 255)            # --color-on-primary / dark bg #09090b
FONT_PATH = "/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf"

def make_icon(size: int) -> Image.Image:
    # Render at 4x for clean downscale antialiasing
    scale = 4
    s = size * scale
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    radius = int(s * 0.22)  # matches rounded-lg proportions on the sidebar mark
    draw.rounded_rectangle([0, 0, s - 1, s - 1], radius=radius, fill=LIME)

    font_size = int(s * 0.62)
    font = ImageFont.truetype(FONT_PATH, font_size)
    text = "F"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (s - tw) / 2 - bbox[0]
    y = (s - th) / 2 - bbox[1]
    draw.text((x, y), text, font=font, fill=INK)

    return img.resize((size, size), Image.LANCZOS)

def main():
    sizes = [16, 32, 48, 180]
    imgs = {size: make_icon(size) for size in sizes}

    imgs[16].save("assets/favicon-16x16.png")
    imgs[32].save("assets/favicon-32x32.png")
    imgs[180].save("assets/apple-touch-icon.png")

    # Multi-size .ico for legacy browser support
    imgs[48].save(
        "assets/favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
    )
    print("done")

if __name__ == "__main__":
    main()
