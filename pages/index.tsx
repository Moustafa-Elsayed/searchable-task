import { useCallback, useEffect, useState } from "react";
import { TextField } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";
import { Private_Key, Url } from "@/api";

interface Category {
  id: number;
  name: string;
  description?: string | null;
  image: string;
  slug: string;
  children?: Category[] | null;
  circle_icon?: string;
  disable_shipping: number;
}

interface SubCatOption {
  id: number;
  name: string;
  options: any;
}

interface MainCategoryData {
  categories: Category[];
}

interface Props {
  mainCategoryData: MainCategoryData;
}

export default function Home({ mainCategoryData }: Props) {
  // states
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
          .get(`${Url}/properties?cat=${value?.id}`, {
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
  const handleSubmit = () => {
    console.log("Submitted!");
    // Handle form submission here
  };

  return (
    <main className="flex min-h-screen flex-row items-start justify-center p-24 gap-5 bg-[#F6F4F5] text-black shadow-2xl h-full">
      <div className="px-4 w-2/4 border border-yellow-400-100 bg-white p-5 flex flex-col justify-center items-center gap-5 rounded-xl">
        <div className="capitalize">Searchable dropdown menu</div>
        <div className="flex flex-col items-center mt-8">
          <div className="flex items-center mb-4">
            <label htmlFor="first-movie" className="mr-1 text-black">
              Select Category
            </label>
            <span className="text-red-500">*</span>
          </div>
          <Autocomplete
            disablePortal
            options={mainCategoryData?.categories}
            sx={{ width: 300 }}
            getOptionLabel={(option) => option.name}
            filterOptions={filterOptions}
            renderInput={(params) => (
              <TextField {...params} label="Main Category" />
            )}
            onChange={handleAutocompleteChange}
          />
          <div className="flex items-center mt-4">
            <label htmlFor="second-movie" className="mr-1 text-black">
              Sub Category{" "}
            </label>
            <span className="text-red-500">*</span>
          </div>
          <Autocomplete
            disablePortal
            options={subCatData || []} // Provide an empty array if subCatData is null
            sx={{ width: 300 }}
            getOptionLabel={(option) => option.name}
            filterOptions={filterOptions}
            renderInput={(params) => (
              <TextField {...params} label="Sub Category" />
            )}
            onChange={handleSubCategoryChange}
          />
          <div className="mt-4 mb-8">
            {subCatOptions.length > 0 && (
              <>
                {subCatOptions.map((item) => (
                  <div className="mt-2" key={item.id}>
                    <label htmlFor="first-movie" className="mr-1 text-black">
                      {item?.name}
                    </label>
                    <Autocomplete
                      disablePortal
                      options={item?.options}
                      sx={{ width: 300 }}
                      getOptionLabel={(option) => option.name}
                      filterOptions={filterOptions}
                      renderInput={(params) => (
                        <>
                          <TextField {...params} />
                          {params.inputProps?.value === "other" && (
                            <TextField
                              id="additional-input"
                              label="Additional Input"
                              variant="outlined"
                              value={additionalInputValue}
                              onChange={(e) =>
                                setAdditionalInputValue(e.target.value)
                              }
                            />
                          )}
                        </>
                      )}
                      onChange={handleCatOptionsChange}
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
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

export async function getServerSideProps() {
  try {
    const GetMainCategoryData = await axios.get(`${Url}/get_all_cats`, {
      headers: {
        "private-key": Private_Key,
      },
    });

    return {
      props: {
        mainCategoryData: GetMainCategoryData?.data?.data,
      },
    };
  } catch (error) {
    return {
      props: {
        apiHeader: null,
      },
    };
  }
}
