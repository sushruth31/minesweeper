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
  let numBombs = (NUM_COLS * NUM_ROWS) / 5
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
      bombMap.set(key, count <= 4 ? count : null)
    }
  }

  return bombMap
}

export default function App() {
  let [revealed, setRevealed] = useState(new Set())
  let map = useMemo(createMap, [])
  let [gameOver, setGameOver] = useState(null)
  let mountedRef = useRef(null)
  window.map = map
  function addToRevealed(key) {
    setRevealed(p => new Set([...p, key]))
  }

  useEffect(() => {
    function getRandomEmptyKey() {
      let attempt = randomKey()
      return map.get(attempt) == null ? attempt : getRandomEmptyKey()
    }
    if (!mountedRef.current) {
      let key = getRandomEmptyKey()

      revealEmptyCells(key)
      mountedRef.current = true
    }
  })

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
    visited.add(key)
    addToRevealed(key)
    if (map.get(key) == null) {
      let neighbors = getNeighbors(key)
      for (let key of neighbors) {
        if (!visited.has(key)) {
          revealEmptyCells(key, visited)
        }
      }
    }
  }

  return (
    <div className="flex items-center flex-col p-4">
      <div className="text-2xl font-bold flex mb-10 items-center flex-col ">
        <h1>Minesweeper</h1>
        {gameOver && <h1>You Lose</h1>}
      </div>
      <Grid
        onCellClick={
          gameOver
            ? () => {}
            : key => {
                addToRevealed(key)
                let val = map.get(key)

                switch (val) {
                  case "bomb":
                    setGameOver({ outcome: Outcomes.LOSE })

                    return

                  case null:
                    return revealEmptyCells(key)
                }
              }
        }
        numCols={NUM_COLS}
        numRows={NUM_ROWS}
        renderCell={renderCell}
      />
    </div>
  )
}
