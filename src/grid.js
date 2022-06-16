import { toKey } from "./App"

export default function Grid({
  onCellClick,
  numRows,
  numCols,
  renderCell: RenderCell,
}) {
  return (
    <>
      {Array.from(Array(numRows)).map((_, rowI) => {
        return (
          <div className="flex border border-zinc-800" key={rowI}>
            {Array.from(Array(numCols)).map((_, colI) => {
              let cellKey = toKey([rowI, colI])
              return (
                <div
                  onClick={e => onCellClick(cellKey, e)}
                  className="w-[40px] bg-zinc-500 cursor-pointer flex items-center justify-center h-[40px] border border-zinc-800"
                  key={colI}
                >
                  <RenderCell cellKey={cellKey} colI={colI} rowI={rowI} />
                </div>
              )
            })}
          </div>
        )
      })}
    </>
  )
}
