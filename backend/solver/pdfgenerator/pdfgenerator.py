from uuid import uuid1

import datetime

from fpdf import FPDF
from fpdf.fonts import FontFace

from item.box import Box

class PDF(FPDF):
    def __init__(self, vehicle_box: Box, image_logo_path: str, company_name: str):
        super().__init__()
        self.add_font('DejaVu', '', 'pdfgenerator/DejaVuSans.ttf', uni=True)
        self.vehicle_box = vehicle_box
        self.uuid = str(uuid1())[0:6]
        self.image_logo_path = image_logo_path
        self.company_name = company_name


    def header(self):
        self.set_font('Times', '', 12)
        
        self.set_draw_color(0, 0, 0)
        self.set_line_width(0.3)
        #headings_style = FontFace(emphasis="BOLD", color=255, fill_color=(255, 100, 0))
        with self.table(
            borders_layout="ALL",
            #cell_fill_color=(224, 235, 255),
            #cell_fill_mode=TableCellFillMode.ROWS,
            col_widths=(30, 90, 15, 25),
            #headings_style=headings_style,
            first_row_as_headings=False,
            num_heading_rows=0,
            line_height=6,
            text_align=("CENTER", "CENTER", "CENTER", "CENTER"),
            width=self.w * 0.7,
        ) as table:
            row = table.row()
            row.cell(img=self.image_logo_path, rowspan=4)
            row.cell("PETUNJUK PELAKSANAAN PEMUATAN KARGO UMUM (IMPLEMENTATION INSTRUCTION OF CARGO LOADING)", rowspan=3)
            row.cell("REV.")
            row.cell("00")

            row = table.row()
            row.cell("DATE")
            row.cell(f"{datetime.datetime.now().strftime('%d/%m/%Y')}")

            row = table.row()
            row.cell(f"{self.uuid}/IFF/{datetime.datetime.now().strftime('%Y')}", colspan=2)

            row = table.row()
            row.cell(f"PT. {self.company_name}")
            row.cell(f"Page {self.page_no()}", colspan=2)
        self.set_draw_color(0, 0, 0)
        self.set_fill_color(255, 255, 255)
        self.set_line_width(0.3)

        self.ln(15)

    def footer(self):
        self.set_y(-15)
        #self.set_font("helvetica", "I", 8)
        self.set_font("Times", size=12)
        self.set_text_color(128)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")

    def chapter_title(self, num, label):
        #self.set_font("helvetica", "", 12)
        self.set_font("Times", size=12)
        self.set_fill_color(200, 220, 255)
        self.cell(
            0,
            6,
            f"Chapter {num} : {label}",
            new_x="LMARGIN",
            new_y="NEXT",
            border="L",
            fill=True,
        )
        self.ln(4)

    def chapter_body(self, fname):
        # Reading text file:
        with open(fname, "rb") as fh:
            txt = fh.read().decode("latin-1")
        with self.text_columns(
            ncols=3, gutter=5, text_align="J", line_height=1.19
        ) as cols:
            # Setting font: Times 12
            self.set_font("Times", size=12)
            cols.write(txt)
            cols.ln()
            # Final mention in italics:
            self.set_font(style="I")
            cols.write("(end of excerpt)")

    def print_chapter(self, num, title, fname):
        self.add_page()
        self.chapter_title(num, title)
        self.chapter_body(fname)

    def numbering(self, level: int, numbering_font: str, numbering_text: str, text: str):
        #self.set_font('DejaVu', '', 12)
        self.set_font(numbering_font, '', 12)
        self.set_x(25 + 10 * (level - 1))
        self.cell(10, 7, text=numbering_text)  # Bullet point
        self.set_font('Times', '', 12)
        self.multi_cell(0, 7, text=text)




    def first_page(self):
        self.add_page("P", "a4")

        with self.table(borders_layout="NONE",
            cell_fill_color=(255, 255, 255),
            #cell_fill_mode=TableCellFillMode.ROWS,
            col_widths=(40, 120),
            #headings_style=headings_style,
            first_row_as_headings=False,
            num_heading_rows=0,
            line_height=6,
            text_align=("LEFT", "LEFT"),
            width=160,
        ) as table:
            row = table.row()
            row.cell("Waktu Pemuatan")
            row.cell(f": {datetime.datetime.now().strftime('%d/%m/%Y, %H:%M:%S')}")

            row = table.row()
            row.cell("Nomor Kontainer")
            row.cell(f": {self.vehicle_box.id}")

            row = table.row()
            row.cell("Ukuran Kontainer")
            row.cell(f": {self.vehicle_box.size[0]} x {self.vehicle_box.size[1]} x {self.vehicle_box.size[2]} cm")

            # row = table.row()
            # row.cell("Nama Kendaraan")
            # row.cell(f": Black Pearl")

            # row = table.row()
            # row.cell("Tujuan")
            # row.cell(f": Port Royale")

        self.ln(15)
        
        self.numbering(1, "Times", "I.", "Persiapan Kontainer")
        self.numbering(2, "Times", "1.", "Pemeriksaan Kontainer:")
        self.numbering(3, "DejaVu", u'\u2022', "Pastikan kontainer dalam kondisi baik, bersih, dan kering.")
        self.numbering(3, "DejaVu", u'\u2022', "Periksa adanya kerusakan yang bisa mempengaruhi keamanan cargo.")
        self.numbering(2, "Times", "2.", "Perlengkapan Pemuatan:")
        self.numbering(3, "DejaVu", u'\u2022', "Pastikan semua alat pemuatan seperti forklift, jack, tali, dan selimut pelindung tersedia dan dalam kondisi baik.")

        self.numbering(1, "Times", "II.", "Penyusunan Cargo")
        self.numbering(2, "Times", "1.", "Perencanaan Penyusunan:")
        self.numbering(3, "DejaVu", u'\u2022', "Susun rencana penyusunan cargo berdasarkan berat, ukuran, dan sensitivitas barang.")
        self.numbering(3, "DejaVu", u'\u2022', "Pastikan barang berat tidak diletakkan di atas barang ringan. Form rencana susunan kargo terlampir.")
        self.numbering(3, "DejaVu", u'\u2022', "Gunakan prinsip 'Last In, First Out' (LIFO) untuk barang yang dibutuhkan pertama kali di tujuan (Jika diperlukan).")
        self.numbering(2, "Times", "2.", "Penyusunan Barang:")
        self.numbering(3, "DejaVu", u'\u2022', "Mulai dengan barang terberat diletakkan di lantai kontainer.")
        self.numbering(3, "DejaVu", u'\u2022', "Barang yang lebih ringan bisa disusun di atasnya, pastikan stabilitas.")
        self.numbering(3, "DejaVu", u'\u2022', "Gunakan bahan pengisi (dunnage) untuk menghindari pergerakan barang selama transit.")
        self.numbering(3, "DejaVu", u'\u2022', "Posisi penyusunan kargo harus sesuai dengan perencanaan")
        self.numbering(2, "Times", "3.", "Pengikatan dan Pengamanan:")
        self.numbering(3, "DejaVu", u'\u2022', "Gunakan tali dan ikatan untuk mengamankan barang.")
        self.numbering(3, "DejaVu", u'\u2022', "Pastikan tidak ada ruang kosong yang bisa menyebabkan barang bergeser.")

        self.numbering(1, "Times", "III.", "Dokumentasi")
        self.numbering(2, "DejaVu", u'\u2022', "Catat setiap langkah pemuatan, termasuk posisi dan pengamanan barang.")
        self.numbering(2, "DejaVu", u'\u2022', "Ambil foto sebagai bukti kondisi barang dan penyusunannya sebelum menutup kontainer.")

        self.numbering(1, "Times", "IV.", "Penutupan dan Segel")
        self.numbering(2, "DejaVu", u'\u2022', "Pastikan semua pintu kontainer tertutup dengan baik.")
        self.numbering(2, "DejaVu", u'\u2022', "Pasang segel keamanan dan catat nomor segel untuk dokumen pengiriman.")

        self.numbering(1, "Times", "V.", "Peninjauan Akhir")
        self.numbering(2, "DejaVu", u'\u2022', "Lakukan peninjauan akhir untuk memastikan semua SOP telah diikuti.")
        self.numbering(2, "DejaVu", u'\u2022', "Tandatangani dan berikan formulir ini kepada pihak yang bertanggung jawab atas pengiriman.")


    def second_page(self):
        self.add_page("L", "a4")
        self.write(text="Lampiran 1: Form Penyusunan Kargo\n")
        with self.table(borders_layout="NONE",
            cell_fill_color=(255, 255, 255),
            #cell_fill_mode=TableCellFillMode.ROWS,
            col_widths=(40, 120),
            #headings_style=headings_style,
            first_row_as_headings=False,
            num_heading_rows=0,
            line_height=6,
            text_align=("LEFT", "LEFT"),
            width=270,
        ) as table:
            row = table.row()
            row.cell("Nomor Kontainer")
            row.cell(f": {self.vehicle_box.id}")

            row = table.row()
            row.cell("Tanggal Pemuatan")
            row.cell(f": {datetime.datetime.now().strftime('%d/%m/%Y')}")

            row = table.row()
            row.cell("Ukuran Kontainer")
            row.cell(f": {self.vehicle_box.size[0]} x {self.vehicle_box.size[1]} x {self.vehicle_box.size[2]} cm")

        self.ln(15)

        self.set_draw_color(255, 0, 0)
        self.set_line_width(0.3)
        headings_style = FontFace(emphasis="BOLD", color=0, fill_color=(115, 230, 255))
        with self.table(
            borders_layout="ALL",
            #cell_fill_color=(224, 235, 255),
            #cell_fill_mode=TableCellFillMode.ROWS,
            col_widths=(10, 40, 40, 30, 50),
            headings_style=headings_style,
            first_row_as_headings=True,
            num_heading_rows=1,
            line_height=6,
            text_align=("CENTER", "LEFT", "LEFT", "LEFT", "LEFT"),
            width=270,
        ) as table:
            row = table.row()
            row.cell("Packing Kendaraan", colspan=5)

            row = table.row()
            row.cell("No. Urut")
            row.cell("Jenis Barang")
            row.cell("Dimensi (P x L x T)")
            row.cell("Berat")
            row.cell("Posisi dalam Kontainer")

            self.set_draw_color(0, 0, 0)

            # temp_list = [
            #     [1, "awkokwa", [2,3,1], 5, [4,1,2]],
            #     [2, "awefawa", [2,5,1], 7, [4,2,2]],
            #     [3, "awewdea", [2,3,6], 9, [4,3,2]],
            #             ]
            
            # for temp1 in temp_list:
            #     row = table.row()
            #     for temp2 in temp1:
            #         row.cell(str(temp2))

            for insertion_order, item in enumerate(self.vehicle_box.packed_items):
                row = table.row()
                row.cell(str(insertion_order + 1))
                row.cell(str(item.name))
                row.cell(f'{item.size[0]} x {item.size[1]} x {item.size[2]} cm')
                row.cell(str(item.weight))
                row.cell(f'{item.position[0]}, {item.position[1]}, {item.position[2]} cm')

        self.ln(15)

        for _, item in enumerate(self.vehicle_box.packed_items):
            if isinstance(item, Box):
                self.set_draw_color(255, 0, 0)
                self.set_line_width(0.3)
                headings_style = FontFace(emphasis="BOLD", color=0, fill_color=(115, 230, 255))
                with self.table(
                    borders_layout="ALL",
                    #cell_fill_color=(224, 235, 255),
                    #cell_fill_mode=TableCellFillMode.ROWS,
                    col_widths=(10, 40, 40, 30, 50),
                    headings_style=headings_style,
                    first_row_as_headings=True,
                    num_heading_rows=1,
                    line_height=6,
                    text_align=("CENTER", "LEFT", "LEFT", "LEFT", "LEFT"),
                    width=270,
                ) as table:
                    row = table.row()
                    row.cell(f"Packing Box {item.name}", colspan=5)

                    row = table.row()
                    row.cell("No. Urut")
                    row.cell("Jenis Barang")
                    row.cell("Dimensi (P x L x T)")
                    row.cell("Berat")
                    row.cell("Posisi dalam Kontainer")

                    self.set_draw_color(0, 0, 0)

                    for insertion_order, item2 in enumerate(item.packed_items):
                        row = table.row()
                        row.cell(str(insertion_order + 1))
                        row.cell(str(item2.name))
                        row.cell(f'{item2.size[0]} x {item2.size[1]} x {item2.size[2]} cm')
                        row.cell(str(item2.weight))
                        row.cell(f'{item2.position[0]}, {item2.position[1]}, {item2.position[2]} cm')

                self.ln(15)



        self.write(text="Diagram/Sketsa Penyusunan:\n")
        self.write(text="(Sertakan gambar atau sketsa untuk memperjelas penyusunan dan posisi cargo)\n")

        self.ln(15)
        self.write(text=f"Saya, {self.author}, telah memeriksa dan memverifikasi bahwa urutan penyusunan cargo dalam kontainer telah sesuai dengan petunjuk pelaksanaan dan keamanan barang terjamin.\n\n")
        self.write(text=f"Tanggal: {datetime.datetime.now().strftime('%d/%m/%Y')}\n\n")
        self.write(text="Tanda Tangan: ______________\n\n")



def generate_vehicle_shipment_pdf(vehicle_box: Box,
                                  output_path: str,
                                  image_logo_path: str,
                                  company_name: str,
                                  author_name:str = "Santana Yuda Pradata"):
    pdf = PDF(vehicle_box, image_logo_path, company_name)
    pdf.set_title("Formulir Panduan Packing")
    pdf.set_author(author_name)
    #pdf.print_chapter(1, "A RUNAWAY REEF", "20k_c1.txt")
    #pdf.print_chapter(2, "THE PROS AND CONS", "20k_c1.txt")

    pdf.first_page()
    pdf.second_page()

    pdf.output(output_path)

