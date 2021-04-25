import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

export const stdInput = (question, prefixAns) => new Promise(resolve => {
  rl.question(`${question}: `, ans => {
    resolve(ans)
    console.log(`${prefixAns}: ${ans}`)
    rl.close()
  })
})
