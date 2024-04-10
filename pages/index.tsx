"use client"
import React, { useState, useCallback, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import { Private_Key, Url } from "@/api";

interface Category {
  id: number;
  name: string;
  children?: Category[] | null;
}

interface SubCatOption {
  id: number;
  name: string;
  options?: Option[];
}

interface Option {
  id: number;
  name: string;
}

export default function Home(): JSX.Element {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCatData, setSubCatData] = useState<Category[] | null>(null);
  const [subCatOptions, setSubCatOptions] = useState<SubCatOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubCategories, setSelectedSubCategories] = useState<Category[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<SubCatOption[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await axios.get(`${Url}/get_categories`, {
          headers: {
            "private-key": Private_Key,
          },
        });
        const { data } = response.data;
        setCategories(data.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }

    fetchCategories();
  }, []);

  const handleAutocompleteChange = useCallback(
    (value: Category | null) => {
      if (value && Array.isArray(value.children)) {
        setSelectedCategory(value);
        setSubCatData(value.children);
        setSelectedSubCategories([]);
        setSelectedOptions([]);
      } else {
        setSelectedCategory(null);
        setSubCatData(null);
        setSelectedSubCategories([]);
        setSelectedOptions([]);
      }
    },
    []
  );

  const handleSubCategoryChange = useCallback(
    async (value: Category | null) => {
      if (value) {
        try {
          const response = await axios.get<{ data: SubCatOption[] }>(`${Url}/properties?cat=${value.id}`, {
            headers: {
              "private-key": Private_Key,
            },
          });
          const { data } = response.data;
          setSubCatOptions(
            data.map((category: SubCatOption) => ({
              ...category,
              options: [
                ...category.options,
                {
                  id: new Date().getTime(),
                  name: "other",
                },
              ],
            }))
          );
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      } else {
        console.error("Any error");
      }
    },
    []
  );

  const handleSubmit = () => {
    console.log("Submitted!");
    // Handle form submission here
  };

  return (
    <main className="flex min-h-screen flex-row items-start justify-center p-24 gap-5 bg-[#F6F4F5] text-black shadow-2xl h-full">
      <div className="px-4 w-2/4 border border-yellow-400-100 bg-white p-5 flex flex-col justify-center items-center gap-5 rounded-xl">
        <div className="capitalize">Searchable dropdown menu</div>

        <div className="capitalize">Select a category</div>
        <Select
          className="w-full"
          value={selectedCategory}
          onChange={handleAutocompleteChange}
          options={categories.map((category) => ({
            value: category,
            label: category.name,
          }))}
        />
        {subCatData && (
          <>
            <div className="capitalize">Select a sub-category</div>
            <Select
              className="w-full"
              isMulti
              value={selectedSubCategories}
              onChange={(options) => setSelectedSubCategories(options)}
              options={subCatData.map((subcategory) => ({
                value: subcategory.id,
                label: subcategory.name,
                children: subcategory.children,
              }))}
            />
          </>
        )}
        {selectedSubCategories.length > 0 && (
          <>
            <div className="capitalize">Select options</div>
            <Select
              className="w-full"
              isMulti
              value={selectedOptions}
              onChange={setSelectedOptions}
              options={subCatOptions.map((option) => ({
                value: option.id,
                label: option.name,
              }))}
            />
          </>
        )}
        <button
          onClick={handleSubmit}
          className="border border-gray-500 w-1/4 h-10 rounded-xl bg-[#F6F4F5]"
        >
          Submit
        </button>
      </div>
    </main>
  );
}
