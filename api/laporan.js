const axios = require('axios');
const route = process.env.WP_REST_ROUTE
const pass = Buffer.from(process.env.WP_APP_PASSWORD).toString('base64');

axios.defaults.baseURL = route
axios.defaults.headers.common['Authorization'] = "Basic " + pass;

module.exports = {
    async tambah(data) {
        return await axios.post("/laporan_harian", data).then((res) => {
            return res.data
        }).catch((err) => {
            throw new Error(err.message)
        })
    },
    async lihat(id) {
        return await axios.get("/laporan_harian?team_id=" + id)
            .then(res => {
                return res.data
            })
            .catch(err => {
                throw new Error(err.message)
            })
    }
}