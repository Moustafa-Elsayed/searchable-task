import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import Home from './Home';
jest.mock('axios');

describe('Home component', () => {
  const mockCategories = [
    {
      id: 1,
      name: 'Category 1',
      children: [{ id: 11, name: 'Sub Category 1' }],
    },
    {
      id: 2,
      name: 'Category 2',
      children: [],
    },
  ];

  const mockProps = {
    mainCategoryData: {
      categories: mockCategories,
    },
  };

  it('should handle autocomplete change and set subCatData correctly', () => {
    const { getByLabelText } = render(<Home {...mockProps} />);
    const mainCategoryInput = getByLabelText('Select Category');
    fireEvent.change(mainCategoryInput, { target: { value: 'Category 1' } });

    fireEvent.click(mainCategoryInput);

    const categoryOption = document.querySelector('[data-option-index="0"]');
    fireEvent.click(categoryOption);
    expect(mainCategoryInput.value).toBe('Category 1');
  });

  it('should handle sub-category change and set subCatOptions correctly', async () => {
    const { getByLabelText, getByText } = render(<Home {...mockProps} />);
    const subCategoryInput = getByLabelText('Sub Category');

    fireEvent.change(subCategoryInput, { target: { value: 'Sub Category 1' } });

    const mockApiResponse = {
      data: {
        data: [{ id: 1, name: 'Option 1' }],
      },
    };

    axios.get.mockResolvedValueOnce(mockApiResponse);

    fireEvent.click(subCategoryInput);

    await new Promise(setImmediate);
    const optionElement = getByText('Option 1');
    expect(optionElement).toBeInTheDocument();
  });

  it('should handle submit and set showTable to true', () => {
    const { getByText } = render(<Home {...mockProps} />);
    const submitButton = getByText('Submit');

    fireEvent.click(submitButton);

    const table = document.querySelector('table');
    expect(table).toBeInTheDocument();
  });
});
