const { Scenes, Markup } = require("telegraf");
const laporan = require('../api/laporan')
let schema = require('../schema.json')

module.exports = {
    // Scene untuk menambah laporan harian
    tambah: new Scenes.WizardScene(
        "TAMBAH_LAPORAN_HARIAN",
        async (ctx) => {
            const btnGroup = schema.kategori_pekerjaan.map(cat => Markup.button.callback(cat[0], cat[1]))
            await ctx.reply("Pilih kategori pekerjaan harianmu",
                Markup.keyboard(btnGroup, {
                    columns: 2
                }).oneTime(true)
            )
            return ctx.wizard.next();
        },
        async (ctx) => {
            const selected = ctx.message.text;
            ctx.scene.session.kategori = selected;
            await ctx.replyWithMarkdown([
                `Kamu memilih ${selected}`,
                `Deskripsikan pekerjaanmu hari ini`,
                `_(1 item pekerjaan untuk setiap pelaporan)_`
            ].join("\n"), Markup.removeKeyboard())
            return ctx.wizard.next();
        },
        async (ctx) => {
            ctx.scene.session.desc = ctx.message.text;
            await ctx.replyWithMarkdown([
                "Tuliskan Keterangan",
                "Keterangan dapat berupa kendala, saran, masukan, atau hal-hal lain yang berkaitan dengan item pekerjaan yang Anda lakukan"
            ].join("\n"))
            return ctx.wizard.next();
        },
        async (ctx) => {
            ctx.scene.session.ket = ctx.message.text;

            const data = {
                team_id: ctx.from.id.toString(),
                kategori_pekerjaan: ctx.scene.session.kategori,
                deskripsi: ctx.scene.session.desc,
                keterangan: ctx.scene.session.ket
            }
            laporan.tambah(data).then(res => {
                ctx.replyWithMarkdown([
                    "Terima kasih Laporan pekerjaan untuk hari ini berhasil dibuat",
                    "======",
                    "",
                    "*KATEGORI:*",
                    data.kategori_pekerjaan,
                    "",
                    "*KEGIATAN: *",
                    data.deskripsi,
                    "",
                    "*KETERANGAN:*",
                    data.keterangan,
                    "",
                    "Ketik /lapor untuk menambahkan laporan pekerjaan hari ini"
                ].join("\n"));
                return ctx.scene.leave();
            }).catch(err => {
                ctx.reply("Gagal mengirimkan laporan. Reason: " + err.message)
            })
        }

    ),
    // Scene untuk melihat laporan harian hari ini
    lihat: new Scenes.WizardScene(
        "LIHAT_LAPORAN_SAYA",
        async (ctx) => {
            laporan.lihat(ctx.from.id)
                .then(res => {
                    const laporan = res.map(item => ([
                        item.cct_created,
                        "=======",
                        `*${item.kategori_pekerjaan}*: _${item.deskripsi}_`,
                        ""
                    ].join("\n")))
                    ctx.replyWithMarkdown([
                        `*10 LAPORAN TERAKHIR ANDA*`,
                        "==========================",
                        "",
                        laporan.join("\n")
                    ].join("\n"))
                })
                .catch(err => {
                    ctx.reply("Gagal melihat laporan. Reason: " + err.message)
                })
        }
    )
}
