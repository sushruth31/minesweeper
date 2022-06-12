import Grid from "./grid"
import { useMemo, useState } from "react"
import bombImgSrc from "./bomb.png"

const NUM_ROWS = 16
const NUM_COLS = 16

export function toKey(arr) {
  return arr[0] + "-" + arr[1]
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

function getNeihbors(key) {}

function createMap() {
  //loop through each sq in grid. get neihbors. count number of bombs. combine maps
  let bombMap = plantBombs()
  return bombMap
}

export default function App() {
  let [revealed, setRevealed] = useState(new Set())
  let map = useMemo(createMap, [])

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
