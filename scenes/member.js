const { Scenes } = require("telegraf");
const member = require('../api/member')

module.exports = {
    register: new Scenes.WizardScene("REGISTER_MEMBER",
        async (ctx) => {
            await ctx.reply('Tulis nama lengkap kamu');
            return ctx.wizard.next();
        },
        async (ctx) => {
            ctx.scene.session.nama_lengkap = ctx.message.text;
            await ctx.replyWithMarkdown(`Nama kamu *${ctx.scene.session.nama_lengkap}*`)
            await ctx.reply('Masukkan jabatan kamu')
            return ctx.wizard.next();
        },
        async (ctx) => {
            const data = {
                nama_lengkap: ctx.scene.session.nama_lengkap,
                jabatan: ctx.message.text,
                telegram_id: ctx.from.id.toString()
            }
            await member.create(data).then(() => {
                console.log(data);
                ctx.reply([
                    "Selamat! Kamu berhasil mendaftar sebagai member.",
                    "Berikut data Anda: ",
                    "=================",
                    "Nama: " + data.nama_lengkap,
                    "Jabatan: " + data.jabatan,
                    "ID Telegram: " + data.telegram_id
                ].join('\n'));
                ctx.scene.leave()
            }).catch(err => {
                ctx.reply(err.message)
                ctx.scene.leave()
            })
        }
    )
}