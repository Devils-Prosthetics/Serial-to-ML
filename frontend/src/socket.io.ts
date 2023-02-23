import io from 'socket.io-client'

export const useSocketIO = () => {
    const socket = io('localhost:8080', {
        path: '/api/socket.io'
    })
    return {
        socket,
    }
}
