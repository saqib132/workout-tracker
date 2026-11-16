from PIL import Image, ImageDraw, ImageFont

def make_icon(size, path):
    img = Image.new("RGB", (size, size), (20, 24, 28))
    draw = ImageDraw.Draw(img)
    pad = int(size * 0.16)
    draw.rounded_rectangle([pad, pad, size - pad, size - pad], radius=int(size*0.12), outline=(90, 200, 160), width=max(2, size // 20))
    bar_w = int(size * 0.1)
    bar_y = size // 2 - bar_w // 2
    draw.rectangle([size*0.18, bar_y, size*0.82, bar_y + bar_w], fill=(90, 200, 160))
    plate_w = int(size * 0.1)
    plate_h = int(size * 0.32)
    for x in [size*0.14, size*0.28, size*0.72 - plate_w/size*size, size*0.86 - plate_w]:
        pass
    for cx in [size*0.20, size*0.80]:
        draw.rounded_rectangle([cx - plate_w/2, size/2 - plate_h/2, cx + plate_w/2, size/2 + plate_h/2], radius=int(plate_w*0.3), fill=(90, 200, 160))
    img.save(path)

make_icon(192, "icons/icon-192.png")
make_icon(512, "icons/icon-512.png")
print("done")
