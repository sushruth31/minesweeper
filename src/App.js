import Grid from "./grid"
import { useMemo, useState } from "react"
import bombImgSrc from "./bomb.png"

const NUM_ROWS = 16
const NUM_COLS = 16

export function toKey(arr) {
  return arr[0] + "-" + arr[1]
}

function toArr(key) {
  return key.split("-").map(Number)
}

let colorMap = {
  1: "blue",
  2: "green",
  3: "red",
}

function plantBombs() {
  let numBombs = Math.floor(Math.sqrt(NUM_ROWS * NUM_COLS))
  let bombs = new Set()
  let map = new Map()

  function createBombKey() {
    let randRow = Math.floor(Math.random() * NUM_ROWS)
    let randCol = Math.floor(Math.random() * NUM_COLS)
    let bombAttempt = toKey([randRow, randCol])
    if (bombs.has(bombAttempt)) {
      return createBombKey()
    }
    bombs.add(bombAttempt)
    return bombAttempt
  }

  for (let i = 0; i < numBombs; i++) {
    map.set(createBombKey(), "bomb")
  }
  return map
}

function filterInvalid([r, c]) {
  return r >= 0 && r <= NUM_ROWS && c >= 0 && c <= NUM_COLS
}
window.getNeighbors = getNeighbors

//['1-1', '2-2']
function getNeighbors(key) {
  let [r, c] = toArr(key)
  let neihbors = [
    [r - 1, c - 1],
    [r - 1, c],
    [r - 1, c + 1],
    [r, c - 1],
    [r, c + 1],
    [r + 1, c - 1],
    [r + 1, c],
    [r + 1, c + 1],
  ]
    .filter(filterInvalid)
    .map(toKey)
  return neihbors
}

function createMap() {
  let bombMap = plantBombs()
  //loop through each sq in grid. get neihbors. count number of bombs. combine maps
  for (let i = 0; i < NUM_ROWS; i++) {
    for (let j = 0; j < NUM_COLS; j++) {
      let key = toKey([i, j])
      //if it is a bomb go to next square
      if (bombMap.get(key)) {
        continue
      }
      let neighbors = getNeighbors(key)
      let count = neighbors.reduce((acc, cur) => {
        if (bombMap.get(cur) === "bomb") {
          return acc + 1
        }
        return acc
      }, 0)
      bombMap.set(key, count <= 3 ? count : null)
    }
  }

  return bombMap
}

export default function App() {
  let [revealed, setRevealed] = useState(new Set())
  let map = useMemo(createMap, [])
  window.bombMap = map

  function renderCell({ cellKey }) {
    let val = map.get(cellKey)
    return (
      <div className="font-bold text-2xl" style={{ color: colorMap[val] }}>
        {val === "bomb" ? <img className="p-1" src={bombImgSrc} /> : val}
      </div>
    )
  }

  return (
    <div className="flex items-center flex-col p-4">
      <h1 className="text-2xl font-bold mb-10">Minesweeper</h1>
      <Grid
        onCellClick={key => setRevealed(p => new Set([...p, key]))}
        numCols={NUM_COLS}
        numRows={NUM_ROWS}
        renderCell={renderCell}
      />
    </div>
  )
}
