import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { FilterPanel } from './FilterPanel'

describe('FilterPanel', () => {
  test('reports selected space and tag', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <FilterPanel
        filters={{}}
        onChange={onChange}
        spaces={[{ id: 2, name: 'Учёба' }]}
        tags={[{ id: 5, name: 'важное' }]}
      />,
    )

    await user.selectOptions(screen.getByLabelText('Пространство'), '2')
    expect(onChange).toHaveBeenCalledWith({ space: 2 })

    await user.selectOptions(screen.getByLabelText('Тег'), '5')
    expect(onChange).toHaveBeenCalledWith({ tags: [5] })
  })
})
