const axios = require('axios')
const route = process.env.WP_REST_ROUTE
const pass = Buffer.from(process.env.WP_APP_PASSWORD).toString('base64');

axios.defaults.baseURL = route
axios.defaults.headers.common['Authorization'] = "Basic " + pass;
module.exports = {
    async create(data) {
        return await axios.post("/team_member", data).then((res) => {
            console.log(res.data);
            return res.data
        }).catch((err) => {
            console.log(err);
            throw new Error(err.message)
        })
    },
    async checkMember(id) {
        return await axios.get('/team_member?telegram_id=' + id).then(res => {
            if (res.data.length === 0) {
                return {
                    status: true,
                }
            } else {
                return {
                    status: false,
                    data: res.data[0]
                }
            }
        }).catch(err => {
            throw new Error("Gagal melakukan pendaftaran. Reason: " + err.message)
        })
    },
    async getMember(){
        return await axios.get('/team_member').then(res => {
            return res.data
        }).catch(err => {
            throw new Error("Gagal mengambil seluruh member. REASON: " + err.message)
        })
    }
}