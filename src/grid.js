export default function Grid({ numRows, numCols, renderCell: RenderCell }) {
  return (
    <>
      {Array.from(Array(numRows)).map((_, rowI) => {
        return (
          <div className="flex border border-zinc-500" key={rowI}>
            {Array.from(Array(numCols)).map((_, colI) => {
              return (
                <div
                  className="w-[40px] cursor-pointer flex items-center justify-center h-[40px] border border-zinc-500"
                  key={colI}
                >
                  <RenderCell colI={colI} rowI={rowI} />
                </div>
              )
            })}
          </div>
        )
      })}
    </>
  )
}
