type Props = {
  pinned: boolean
  onClick: () => void
}

export function PinButton({ pinned, onClick }: Props) {
  return (
    <button className="secondary-button" onClick={onClick} type="button">
      {pinned ? 'Открепить' : 'Закрепить'}
    </button>
  )
}
