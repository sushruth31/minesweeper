import { useContext, createContext, useState } from "react"
import { createPortal } from "react-dom"

const ModalContext = createContext()

export function useVis(ini) {
  let [visible, setVis] = useState(!!ini)
  let toggle = val => setVis(p => (typeof val === "boolean" ? val : !p))
  let show = () => setVis(true)
  let hide = () => setVis(false)
  return { toggle, visible, show, hide }
}

export default function ModalProvider({ children }) {
  let modal = useVis()
  let [content, setContent] = useState(null)
  let handleModal = content => {
    modal.toggle()
    if (content) {
      setContent(content)
    }
  }
  return (
    <ModalContext.Provider value={{ ...modal, handleModal, content }}>
      <Modal />
      {children}
    </ModalContext.Provider>
  )
}

export function Modal() {
  let values = useModal()
  if (values.visible) {
    return createPortal(
      <div
        onClick={values.hide}
        className="fixed top-0 left-0 h-screen w-full flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.8)" }}
      >
        <div className="bg-white relative p-5 shadow-lg rounded flex flex-col items-start text-lg text-gray-800">
          <p>{values.content}</p>
        </div>
      </div>,
      document.getElementById("modal")
    )
  }
  return null
}

export const useModal = () => useContext(ModalContext)
