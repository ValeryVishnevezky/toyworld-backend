import fs from 'fs'
import { utilService } from './util.service.js'

const PAGE_SIZE = 3
const toys = utilService.readJsonFile('data/toy.json')

export const toyService = {
    query,
    get,
    remove,
    save,
}

function query(filterBy = {}) {
    let filteredToys = toys;
    if (!filterBy.title) filterBy.title = '';
    if (!filterBy.maxPrice) filterBy.maxPrice = Infinity;
    if (!filterBy.desc) filterBy.desc = '';
    if (!filterBy.labels) filterBy.labels = [];
    if (filterBy.inStock === 'true') filterBy.inStock = true;
    else if (filterBy.inStock === 'false') filterBy.inStock = false;
    else filterBy.inStock = '';

    const titleRegExp = new RegExp(filterBy.title, 'i');
    const descRegExp = new RegExp(filterBy.desc, 'i');

    filteredToys = filteredToys.filter(toy =>
        titleRegExp.test(toy.title) &&
        toy.price <= filterBy.maxPrice &&
        descRegExp.test(toy.desc) &&
        (filterBy.labels.length === 0 || filterBy.labels.every(label => toy.labels.includes(label))) &&
        (filterBy.inStock === '' || toy.inStock === filterBy.inStock)
    );
    return Promise.resolve(filteredToys);
}


function get(toyId) {
    const toy = toys.find(toy => toy._id === toyId)
    if (!toy) return Promise.reject('Toy not found')
    return Promise.resolve(toy)
}

function remove(toyId) {
    const idx = toys.findIndex(toy => toy._id === toyId)
    if (idx === -1) return Promise.reject('No such toy')
    toys.splice(idx, 1)
    return _saveToysToFile()
}

function save(toy) {
    if (toy._id) {
        const idx = toys.findIndex(currToy => currToy._id === toy._id)
        toys[idx] = { ...toys[idx], ...toy }
    } else {
        toy._id = utilService.makeId()
        toy.createdAt = Date.now()
        toy.inStock = true
        toys.unshift(toy)
    }
    return _saveToysToFile().then(() => toy)
}


function _saveToysToFile() {
    return new Promise((resolve, reject) => {
        const toysStr = JSON.stringify(toys, null, 4)
        fs.writeFile('data/toy.json', toysStr, err => {
            if (err) {
                return console.log(err)
            }
            resolve()
        })
    })
}
