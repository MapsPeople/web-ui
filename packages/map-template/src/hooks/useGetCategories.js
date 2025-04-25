import { useState } from "react";
import isNullOrUndefined from "../helpers/isNullOrUndefined";

/*
 * Hook to get all Categories for a specific solution.
 */
export function useGetCategories() {
    const [getCategories, setGetCategories] = useState([]);
    
    if (isNullOrUndefined(getCategories)) {
        window?.mapsindoors?.services?.SolutionsService?.getCategories().then(categories => {
            setGetCategories(categories);
        });
    }

    return getCategories;
}