
// import Serve from './server/index2';

// class Contract {
//     static getConfig(data) {
//         return Serve.get(`/secondContract/configList`, {params:data})
//     }
//     static getSymbol(data) {
//         return Serve.get(`/secondContract/pairList`, {params:data})
//     }
//     static getOrders(data) {
//         return Serve.get(`/secondContract/contractList`, {params:data})
//     }
//     static createOrder(data) {
//         return Serve.get('/secondContract/add', {params:data})
//     }
// }

// export default Contract;


import server from './server'

class Second {
    static getConfig(data) {
        return server.get(`/secondContract/configList`, {params:data})
    }
    static getSymbol(data) {
        return server.get(`/secondContract/pairList`, {params:data})
    }
    static getOrders(data) {
        return server.get(`/secondContract/contractList`, {params:data})
    }
    static createOrder(data) {
        return server.get('/secondContract/add', {params:data})
    }
}

export default Second;
