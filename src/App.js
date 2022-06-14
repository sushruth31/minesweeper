import Grid from "./grid"
import { useEffect, useMemo, useState, useRef } from "react"
import bombImgSrc from "./bomb.png"

const NUM_ROWS = 16
const NUM_COLS = 16

const Outcomes = {
  WIN: "win",
  LOSE: "lose",
}

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

function randomKey() {
  let randRow = Math.floor(Math.random() * NUM_ROWS)
  let randCol = Math.floor(Math.random() * NUM_COLS)
  return toKey([randRow, randCol])
}

function plantBombs() {
  let numBombs = Math.floor(Math.sqrt(NUM_ROWS * NUM_COLS))
  let bombs = new Set()
  let map = new Map()

  function createBombKey() {
    let bombAttempt = randomKey()
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
      let count =
        neighbors.reduce(
          (acc, cur) => (bombMap.get(cur) === "bomb" ? acc + 1 : acc),
          0
        ) || null
      bombMap.set(key, count <= 3 && count)
    }
  }

  return bombMap
}

export default function App() {
  let [revealed, setRevealed] = useState(new Set())
  let map = useMemo(createMap, [])
  let [gameOver, setGameOver] = useState(null)

  function addToRevealed(key) {
    setRevealed(p => new Set([...p, key]))
  }

  useEffect(() => {
    revealEmptyCells(randomKey())
  }, [])

  function renderCell({ cellKey }) {
    let val = map.get(cellKey)
    return (
      <>
        {revealed.has(cellKey) && (
          <div
            className="font-bold text-2xl bg-gray-100 w-full h-full flex items-center justify-center "
            style={{ color: colorMap[val] }}
          >
            {val === "bomb" ? <img className="p-1" src={bombImgSrc} /> : val}
          </div>
        )}
      </>
    )
  }

  function revealEmptyCells(key, visited = new Set()) {
    //check key if bomb and not in visited. uncover . get neighbors and repeat
    let val = map.get(key)
    if (visited.has(key) || val === "bomb") {
      return
    }
    if (typeof val === "number") {
      return addToRevealed(key)
    }
    visited.add(key)
    addToRevealed(key)
    let neighbors = getNeighbors(key)
    for (let key of neighbors) {
      revealEmptyCells(key, visited)
    }
  }

  return (
    <div className="flex items-center flex-col p-4">
      <h1 className="text-2xl font-bold mb-10">Minesweeper</h1>
      <Grid
        onCellClick={key => {
          addToRevealed(key)
          let val = map.get(key)

          switch (val) {
            case "bomb":
              setGameOver({ outcome: Outcomes.LOSE })
              alert("You suck")
              return

            case null:
              return revealEmptyCells(key)
          }
        }}
        numCols={NUM_COLS}
        numRows={NUM_ROWS}
        renderCell={renderCell}
      />
    </div>
  )
}
