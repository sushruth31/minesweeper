import Grid from "./grid"
import { useEffect, useMemo, useState, useRef } from "react"
import bombImgSrc from "./bomb.png"
import { useModal } from "./modalcontext"
import FlagIcon from "@mui/icons-material/Flag"
import HardwareIcon from "@mui/icons-material/Hardware"

const NUM_ROWS = 16
const NUM_COLS = 16

const delay = time => new Promise(resolve => setTimeout(resolve, time))

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

//hello

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
      bombMap.set(key, count)
    }
  }
  for (let [_, v] of bombMap.entries()) {
    //invalid map try again
    if (v >= 5) {
      return createMap()
    }
  }
  return bombMap
}

export default function App() {
  let [revealed, setRevealed] = useState(new Set())
  let [flags, setFlags] = useState(new Set())
  let map = useMemo(createMap, [])
  let modal = useModal()
  window.map = map
  let [gameOver, setGameOver] = useState(null)
  let mountedRef = useRef(null)
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
    let revealedClassName =
      "font-bold text-2xl bg-gray-100 w-full h-full flex items-center justify-center cursor-default"
    if (typeof val === "number") {
      revealedClassName += " hover:bg-blue-300"
    }

    if (flags.has(cellKey)) {
      return (
        <div>
          <FlagIcon style={{ color: "red" }} />
        </div>
      )
    }

    return (
      <>
        {revealed.has(cellKey) && (
          <div className={revealedClassName} style={{ color: colorMap[val] }}>
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
    let val = map.get(key)
    if (val === null) {
      let neighbors = getNeighbors(key)
      for (let key of neighbors) {
        if (!visited.has(key)) {
          revealEmptyCells(key, visited)
        }
      }
    }
  }

  async function showAllBombs() {
    for (let [k, v] of map.entries()) {
      if (v === "bomb" && !revealed.has(k)) {
        await delay(200)
        addToRevealed(k)
      }
    }
  }

  let handleClick = key => {
    modal.hide()
    addToRevealed(key)
    switch (map.get(key)) {
      case "bomb":
        setGameOver({ outcome: Outcomes.LOSE })
        return showAllBombs()

      case null:
        return revealEmptyCells(key)
    }
  }

  return (
    <>
      <div className="flex items-center flex-col p-4">
        <div className="text-2xl font-bold flex mb-10 items-center flex-col ">
          <h1>Minesweeper</h1>
          {gameOver && <h1>You Lose!!</h1>}
        </div>
        <Grid
          onCellClick={(key, { target: { offsetLeft, offsetTop } }) => {
            if (revealed.has(key)) {
              return
            }
            if (flags.has(key)) {
              //remove flag from grid
              return setFlags(p => new Set([...p].filter(k => k !== key)))
            }
            modal.handleModal(
              <div
                style={{ left: offsetLeft, top: offsetTop }}
                className="absolute bg-white rounded"
              >
                <div className="flex items-center justify-center">
                  <FlagIcon
                    onClick={() => setFlags(p => new Set([...p, key]))}
                    style={{ width: 60, height: 60 }}
                    className="cursor-pointer mr-4 p-2 hover:bg-zinc-300"
                  />
                  <HardwareIcon
                    onClick={() => handleClick(key)}
                    className="cursor-pointer p-2 hover:bg-zinc-300"
                    style={{ width: 60, height: 60 }}
                  />
                </div>
              </div>
            )
          }}
          numCols={NUM_COLS}
          numRows={NUM_ROWS}
          renderCell={renderCell}
        />
      </div>
    </>
  )
}
