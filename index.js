const { Scenes, session, Telegraf, Markup } = require('telegraf')
require('dotenv').config()
const cron = require('node-cron');

const member = require('./scenes/member')
const lapor = require('./scenes/lapor')
const apiMember = require('./api/member')

const token = process.env.BOT_TOKEN
if (token === undefined) {
    throw new Error('BOT_TOKEN must be provided!')
}
const bot = new Telegraf(token)

const stage = new Scenes.Stage([member.register, lapor.tambah, lapor.lihat])
bot.use(session());
bot.use(stage.middleware());


// Start the BOT
bot.start((ctx) => {
    ctx.reply('Selamat datang. Silahkan lakukan pendaftaran dengan mengetik /daftar');
})


// aturan untuk melakukan PENDAFTARAN MEMBER
bot.command('daftar', ctx => {
    apiMember.checkMember(ctx.from.id).then((res) => {
        if (res.status) ctx.scene.enter('REGISTER_MEMBER');
        else ctx.reply([
            "Anda sudah terdaftar sebagai member",
            "==============",
            [res.data.nama_lengkap, res.data.jabatan, res.data.telegram_id].join("\n")
        ].join("\n"))
    }).catch(err => ctx.reply(err.message))
})

// Perintah /lapor untuk menambah laporan harian
bot.command('lapor', ctx => {
    ctx.scene.enter("TAMBAH_LAPORAN_HARIAN");
})

// Perintah /lihat untuk menambah lihat laporan
bot.command("lihat", ctx => {
    ctx.scene.enter("LIHAT_LAPORAN_SAYA")
})

// Perintah /batal untuk membatalkan perintah yang sedang berjalan
bot.command("batal", async (ctx) => {
    await ctx.reply("Anda telah membatalkan perintah di atas",
        Markup.removeKeyboard()
    )
    return ctx.scene.leave(['TAMBAH_LAPORAN_HARIAN']);
})

cron.schedule('30 16 * * *', () => {
    apiMember.getMember()
        .then(res => {
            const teamId = res.map(data => data.telegram_id);
            teamId.map(id => {
                bot.telegram.sendMessage(id, "Halo kak. Jangan lupa melakukan laporan harian ya. Ketik /lapor untuk melakukan pelaporannya")
            })
        }).catch(err => {
            console.error("Gagal memanggil. Reason: " + err.message);
        })
}, {
    scheduled: true,
    timezone: "Asia/Jakarta"
});

// inisialisasi bot
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))