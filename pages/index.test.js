import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from './index';
import axios from 'axios';

jest.mock('axios');

describe('Home Component', () => {
  let mainCategoryData;

  beforeEach(() => {
    mainCategoryData = {
      categories: [
        {
          id: 1,
          name: 'Electronics',
          children: [
            { id: 2, name: 'Phones' },
            { id: 3, name: 'Laptops' },
          ],
        },
        {
          id: 4,
          name: 'Clothing',
          children: [
            { id: 5, name: 'Shirts' },
            { id: 6, name: 'Pants' },
          ],
        },
      ],
    };
  });

  test('Selecting a main category updates subCatData', () => {
    render(<Home mainCategoryData={mainCategoryData} />);

    const mainCategoryAutocomplete = screen.getByLabelText('Select Category');
    fireEvent.change(mainCategoryAutocomplete, { target: { value: 'Electronics' } });

    expect(screen.getByLabelText('Sub Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Sub Category')).toBeEnabled();
  });

  test('Selecting a subcategory updates state and makes API call', async () => {
    axios.get.mockResolvedValue({
      data: {
        data: [
          { id: 7, name: 'Color', options: [{ id: 1, name: 'Red' }, { id: 2, name: 'Blue' }] },
          { id: 8, name: 'Size', options: [{ id: 3, name: 'S' }, { id: 4, name: 'L' }] },
        ],
      },
    });

    render(<Home mainCategoryData={mainCategoryData} />);

    const mainCategoryAutocomplete = screen.getByLabelText('Select Category');
    fireEvent.change(mainCategoryAutocomplete, { target: { value: 'Electronics' } });

    const subCategoryAutocomplete = screen.getByLabelText('Sub Category');
    fireEvent.change(subCategoryAutocomplete, { target: { value: 'Phones' } });

    // Await to give enough time for the API call to resolve and update the state
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringMatching(/properties\?cat=\d+/),
      expect.any(Object)
    );
  });

  test('Submitting the form calls handleSubmit and shows the table', () => {
    render(<Home mainCategoryData={mainCategoryData} />);

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });
});
