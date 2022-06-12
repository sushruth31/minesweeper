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
          <div className="flex border border-zinc-500" key={rowI}>
            {Array.from(Array(numCols)).map((_, colI) => {
              let cellKey = toKey([rowI, colI])
              return (
                <div
                  onClick={() => onCellClick(cellKey)}
                  className="w-[40px] cursor-pointer flex items-center justify-center h-[40px] border border-zinc-500"
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
