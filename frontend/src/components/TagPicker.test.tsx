import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TagPicker } from './TagPicker'

describe('TagPicker', () => {
  test('adds and removes a tag', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { rerender } = render(
      <TagPicker
        onChange={onChange}
        tags={[{ id: 1, name: 'важное' }]}
        value={[]}
      />,
    )

    await user.click(screen.getByLabelText('важное'))
    expect(onChange).toHaveBeenCalledWith([1])

    rerender(
      <TagPicker
        onChange={onChange}
        tags={[{ id: 1, name: 'важное' }]}
        value={[1]}
      />,
    )
    await user.click(screen.getByLabelText('важное'))
    expect(onChange).toHaveBeenLastCalledWith([])
  })
})
