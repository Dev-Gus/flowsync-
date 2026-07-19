"""
Generates the 1200x630 OG/social-preview image for FlowSync, matching the
dark (#09090b) + lime (#84cc16) identity used across the dashboard.
"""
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG = (9, 9, 11, 255)          # --color-background (dark)
SURFACE = (24, 24, 27, 255)   # --color-surface (dark)
BORDER = (39, 39, 42, 255)    # --color-border (dark)
LIME = (132, 204, 22, 255)    # --color-primary
FG = (250, 250, 250, 255)     # --color-foreground (dark)
MUTED = (161, 161, 170, 255)  # --color-muted (dark)
PURPLE = (139, 92, 246, 255)  # --color-secondary, used as a small accent

POPPINS_BOLD = "/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf"
POPPINS_SEMIBOLD = "/usr/share/fonts/truetype/google-fonts/Poppins-Medium.ttf"
POPPINS_REGULAR = "/usr/share/fonts/truetype/google-fonts/Poppins-Regular.ttf"
POPPINS_MEDIUM = "/usr/share/fonts/truetype/google-fonts/Poppins-Medium.ttf"


def draw_grid(draw, step=40, color=(255, 255, 255, 10)):
    for x in range(0, W, step):
        draw.line([(x, 0), (x, H)], fill=color, width=1)
    for y in range(0, H, step):
        draw.line([(0, y), (W, y)], fill=color, width=1)


def main():
    # Render at 2x for crisp text, downscale at the end
    scale = 2
    w, h = W * scale, H * scale
    img = Image.new("RGBA", (w, h), BG)
    draw = ImageDraw.Draw(img)

    # subtle dot/grid texture for the "sharp/startup" feel, kept faint
    grid = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(grid)
    step = 80 * scale
    dot_r = 1 * scale
    for x in range(step, w, step):
        for y in range(step, h, step):
            gdraw.ellipse([x - dot_r, y - dot_r, x + dot_r, y + dot_r], fill=(255, 255, 255, 14))
    img.alpha_composite(grid)
    draw = ImageDraw.Draw(img)

    # large soft lime glow behind the logo, top-left
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    cx, cy = int(160 * scale), int(140 * scale)
    for r, a in [(360, 10), (260, 14), (160, 18)]:
        r_s = int(r * scale)
        gdraw.ellipse([cx - r_s, cy - r_s, cx + r_s, cy + r_s], fill=(132, 204, 22, a))
    img.alpha_composite(glow)
    draw = ImageDraw.Draw(img)

    # logo mark: rounded lime square with black "F", matching sidebar logo
    mark_size = int(96 * scale)
    mark_x, mark_y = int(90 * scale), int(84 * scale)
    radius = int(mark_size * 0.28)
    draw.rounded_rectangle(
        [mark_x, mark_y, mark_x + mark_size, mark_y + mark_size],
        radius=radius,
        fill=LIME,
    )
    f_font = ImageFont.truetype(POPPINS_BOLD, int(mark_size * 0.58))
    bbox = draw.textbbox((0, 0), "F", font=f_font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    fx = mark_x + (mark_size - tw) / 2 - bbox[0]
    fy = mark_y + (mark_size - th) / 2 - bbox[1]
    draw.text((fx, fy), "F", font=f_font, fill=BG)

    # wordmark next to the mark
    word_font = ImageFont.truetype(POPPINS_SEMIBOLD, int(48 * scale))
    wx = mark_x + mark_size + int(24 * scale)
    wbbox = draw.textbbox((0, 0), "FlowSync", font=word_font)
    wh = wbbox[3] - wbbox[1]
    wy = mark_y + (mark_size - wh) / 2 - wbbox[1]
    draw.text((wx, wy), "FlowSync", font=word_font, fill=FG)

    # headline
    headline_font = ImageFont.truetype(POPPINS_BOLD, int(64 * scale))
    headline_y = int(260 * scale)
    draw.text((int(90 * scale), headline_y), "Admin dashboard,", font=headline_font, fill=FG)
    draw.text((int(90 * scale), headline_y + int(78 * scale)), "built from scratch.", font=headline_font, fill=LIME)

    # subhead
    sub_font = ImageFont.truetype(POPPINS_REGULAR, int(26 * scale))
    sub_y = int(460 * scale)
    draw.text(
        (int(90 * scale), sub_y),
        "Vanilla JavaScript  \u00b7  Tailwind CSS  \u00b7  Chart.js",
        font=sub_font,
        fill=MUTED,
    )

    # small pill badges bottom-right, echoing the integrations/tech-stack feel
    badge_font = ImageFont.truetype(POPPINS_MEDIUM, int(20 * scale))
    badges = ["Analytics", "Users", "Billing", "Integrations"]
    bx = int(90 * scale)
    by = int(520 * scale)
    pad_x, pad_y = int(18 * scale), int(10 * scale)
    gap = int(14 * scale)
    for label in badges:
        bbox = draw.textbbox((0, 0), label, font=badge_font)
        bw = bbox[2] - bbox[0]
        bh = bbox[3] - bbox[1]
        pill_w = bw + pad_x * 2
        pill_h = bh + pad_y * 2
        draw.rounded_rectangle(
            [bx, by, bx + pill_w, by + pill_h],
            radius=pill_h // 2,
            fill=SURFACE,
            outline=BORDER,
            width=int(1 * scale),
        )
        tx = bx + pad_x - bbox[0]
        ty = by + pad_y - bbox[1]
        draw.text((tx, ty), label, font=badge_font, fill=MUTED)
        bx += pill_w + gap

    # thin lime accent line along the very bottom
    draw.rectangle([0, h - int(6 * scale), w, h], fill=LIME)

    img = img.convert("RGB").resize((W, H), Image.LANCZOS)
    img.save("assets/og-image.png", quality=95)
    print("done")


if __name__ == "__main__":
    main()
