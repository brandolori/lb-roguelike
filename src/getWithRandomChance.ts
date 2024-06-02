export const getWithRandomChance = <T>(options: { option: T; chance: number} []) => {
    const totalWeight = options.reduce((sum, opt) => sum + opt.chance, 0)
    const randomValue = Math.random() * totalWeight
    let cumulativeWeight = 0

    for (const opt of options) {
        cumulativeWeight += opt.chance
        if (randomValue <= cumulativeWeight) {
            return opt.option
        }
    }

    return null // Nessuna opzione valida trovata
}
