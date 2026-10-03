"""Tiny stdlib-only PNG encoder for generating synthetic test "photos".

No Pillow/imaging library dependency — just zlib + struct, matching this
project's stdlib-only rule for validation tooling. Produces a valid,
uncompressed-content-wise-simple RGB PNG of the given size and flat color.
"""
import struct
import zlib
import base64


def _chunk(tag, data):
    out = tag + data
    return struct.pack('>I', len(data)) + out + struct.pack('>I', zlib.crc32(out) & 0xFFFFFFFF)


def make_png_bytes(width, height, rgb):
    signature = b'\x89PNG\r\n\x1a\n'
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)  # 8-bit depth, color type 2 = truecolor RGB
    row = bytes(rgb) * width
    raw = b''.join(b'\x00' + row for _ in range(height))  # filter type 0 (None) per scanline
    idat = zlib.compress(raw)
    return signature + _chunk(b'IHDR', ihdr) + _chunk(b'IDAT', idat) + _chunk(b'IEND', b'')


def make_png_data_url(width, height, rgb):
    png_bytes = make_png_bytes(width, height, rgb)
    encoded = base64.b64encode(png_bytes).decode('ascii')
    return f'data:image/png;base64,{encoded}'
