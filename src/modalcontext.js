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
        className="fixed top-0 left-0 h-screen w-full"
        style={{ background: "rgba(0,0,0,0.4)" }}
      >
        {values.content}
      </div>,
      document.getElementById("modal")
    )
  }
  return null
}

export const useModal = () => useContext(ModalContext)
