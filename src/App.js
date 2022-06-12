import Grid from "./grid"
import { useState } from "react"

const NUM_ROWS = 16
const NUM_COLS = 16

function toKey(arr) {
  return arr[0] + "-" + arr[1]
}

let colorMap = {
  1: "blue",
  2: "green",
  3: "red",
}

export default function App() {
  let [revealed, setRevealed] = useState(new Set())
  let [map, setMap] = useState(
    new Map([
      ["1-1", 1],
      ["1-2", 1],
      ["1-3", null],
    ])
  )

  function renderCell({ rowI, colI }) {
    let val = map.get(toKey([rowI, colI]))
    return (
      <div className="font-bold text-2xl" style={{ color: colorMap[val] }}>
        {val}
      </div>
    )
  }

  return (
    <div className="flex items-center flex-col p-4">
      <h1 className="text-2xl font-bold mb-10">Minesweeper</h1>
      <Grid numCols={NUM_COLS} numRows={NUM_ROWS} renderCell={renderCell} />
    </div>
  )
}
