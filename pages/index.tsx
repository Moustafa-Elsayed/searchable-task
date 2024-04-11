import React, { useState, useCallback, useEffect } from "react";
import {
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
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
  const [selectedValues, setSelectedValues] = useState<any[]>([]);
  const [subCatData, setSubCatData] = useState<Category[] | null>(null);
  const [subCatOptions, setSubCatOptions] = useState<SubCatOption[]>([]);
  const [additionalInputValue, setAdditionalInputValue] = useState("");
  const [showTable, setShowTable] = useState(false); // State variable to track table visibility

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
    const selectedData = selectedValues.map((value) => ({
      key: value.key,
      name: value.value.name,
      ...value.value, // Include all properties of the selected value
    }));
    console.log("Submitted:", selectedData);
    setShowTable(true);
  };

  const handleAdditionalInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAdditionalInputValue(event.target.value);
  };

  useEffect(() => {
    if (additionalInputValue) {
      setSelectedValues((prevValues) => [
        ...prevValues,
        { key: "Additional Input", value: additionalInputValue },
      ]);
    }
  }, [additionalInputValue]);

  return (
    <main className="bg-[#F6F4F5]">
      <div className="flex justify-center pt-7">
        <div className="capitalize text-black text-center font-bold">
          Searchable dropdown menu
        </div>
      </div>
      <div className="flex min-h-screen flex-row items-start justify-center p-24 gap-5  text-black shadow-2xl h-full">
        <div className="px-4 w-2/4 border border-yellow-400 bg-white p-5 flex flex-col justify-center items-center gap-5 rounded-xl">
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
              options={subCatData || []}
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
                                onChange={handleAdditionalInputChange}
                              />
                            )}
                          </>
                        )}
                        onChange={(event, value) => {
                          setSelectedValues((prevValues) => [
                            ...prevValues,
                            { key: item.name, value },
                          ]);
                          handleCatOptionsChange(event, value);
                        }}
                      />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
          <button
            onClick={handleSubmit}
            className="border border-gray-500 w-1/4 h-10 rounded-xl bg-gray-100 hover:bg-gray-200"
          >
            Submit
          </button>
        </div>

        <div className="px-4 w-2/4">
  {showTable && (
    <TableContainer
      component={Paper}
      className="bg-white rounded-xl shadow-md"
    >
      <Table className="min-w-max">
        <TableHead className="bg-gray-200">
          <TableRow>
            <TableCell className="py-3 px-6 text-left">ID</TableCell>
            <TableCell className="py-3 px-6 text-left">Name</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {selectedValues.map((row, index) => (
            <TableRow
              key={index}
              className={index % 2 === 0 ? "bg-gray-100" : ""}
            >
              <TableCell className="py-3 px-6">{row.key}</TableCell>
              <TableCell className="py-3 px-6">
                {typeof row.value === "object"
                  ? row.value.name
                  : row.value}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )}
</div>

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
