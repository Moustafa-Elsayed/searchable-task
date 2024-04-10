import React, { useState, useEffect,useCallback } from "react";
import Select from "react-select";
import axios from "axios";
import { Private_Key, Url } from "@/api";

interface Category {
  id: number;
  name: string;
  children?: Category[] | null;
}

interface Option {
  id: number;
  name: string;
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedSubCategories, setSelectedSubCategories] = useState<
    Category[]
  >([]);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);

  const [subCatData, setSubCatData] = useState<Category[] | null>(null);
  const [subCatOptions, setSubCatOptions] = useState<SubCatOption[]>([]);
  const [additionalInputValue, setAdditionalInputValue] = useState("");

  // callbacks
  const filterOptions = useCallback(
    (options: Category[], { inputValue }: { inputValue: string }) =>
      options.filter((option) =>
        option.name.toLowerCase().includes(inputValue.toLowerCase())
      ),
    []
  );

  const handleAutocompleteChange = useCallback(
    (event: React.SyntheticEvent, value: Category | null) => {
      if (value && Array.isArray(value.children)) {
        setSubCatData(value.children);
      } else {
        setSubCatData([]);
      }
    },
    []
  );

  const handleSubCategoryChange = useCallback(
    (event: React.SyntheticEvent, value: Category | null) => {
      setSubCatOptions([]);
      if (value) {
        console.log(value?.id);
        axios
          .get(`${Main_Url}/properties?cat=${value?.id}`, {
            headers: {
              "private-key": Private_Key,
            },
          })
          .then((res) => {
            setSubCatOptions(
              res?.data?.data.map((category: any) => ({
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
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
          });
      } else {
        console.error("any error");
      }
    },
    []
  );

  const handleCatOptionsChange = useCallback(
    (event: React.SyntheticEvent, value: Category | null) => {
      console.log("Selected value is ", value);
    },
    []
  );
  return (
    <main className="flex min-h-screen flex-row items-start justify-center p-24 gap-5 bg-[#F6F4F5] text-black shadow-2xl h-full">
      <div className="px-4 w-2/4 border border-yellow-400-100 bg-white p-5 flex flex-col justify-center items-center gap-5 rounded-xl">
        <div className="capitalize">Searchable dropdown menu</div>

        <div className="capitalize">Select a category</div>
        <Select
          className="w-full"
          value={selectedCategory}
          onChange={(selectedOption) =>
            handleCategoryChange(selectedOption as Category)
          }
          options={categories.map((category) => ({
            value: category,
            label: category.name,
          }))}
        />
        <div className="capitalize">Select a sub-category</div>
        <Select
          className="w-full"
          isMulti
          value={selectedSubCategories}
          onChange={(selectedOptions) =>
            handleSubCategoryChange(selectedOptions as Category[])
          }
          options={subCategories.map((subcategory) => ({
            value: subcategory.id,
            label: subcategory.name,
            children: subcategory.children,
          }))}
        />
        {selectedCategory && selectedSubCategories.length > 0 && (
          <>
            <div className="capitalize">Select options</div>
            <Select
              className="w-full"
              isMulti
              value={selectedOptions}
              onChange={setSelectedOptions}
              options={options.map((option) => ({
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
