process.send('Listo')

process.on('message',(parentMsg)=>{
    const numParam = parentMsg.split(' ')
    if (numParam[0] == 'Iniciar') {
        const cant = parseInt(numParam[1])
        const result = {}
        for (let i = 0; i < cant; i++) {
            const num = Math.floor(Math.random()*1000)+1;
            let numRes = result[num]
            if (!numRes) {
                    numRes = 1
            } else {
                numRes++
            } 
            result[num] = numRes        
        }
        process.send(result)
    }
})