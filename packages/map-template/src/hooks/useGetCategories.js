import { useState, useEffect } from "react";

/*
 * Hook to get categories for current solution
 */
export function useGetCategories() {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        window?.mapsindoors?.services?.SolutionsService?.getCategories()
            .then(categories => {
                setCategories(categories)
            })
            .catch(err => {
                console.error("Failed to fetch categories", err);
            });
    }, []);

    return categories;
}