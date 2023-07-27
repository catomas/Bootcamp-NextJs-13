import { Cuisine, Location, PRICE } from "@prisma/client";
import Link from "next/link";

interface Props {
  cuisines: Cuisine[];
  locations: Location[];
  searchParams: {
    city?: string;
    cuisine?: string;
    price?: PRICE;
  };
}

export default function SearchSideBar({
  cuisines,
  locations,
  searchParams,
}: Props) {
  const prices = [
    {
      price: PRICE.CHEAP,
      label: "$",
      clasName: "border w-full text-center text-reg font-light rounded-l p-2",
    },
    {
      price: PRICE.REGULAR,
      label: "$$",
      clasName: "border w-full text-center text-reg font-light p-2",
    },
    {
      price: PRICE.EXPENSIVE,
      label: "$$$",
      clasName: "border w-full text-center text-reg font-light rounded-r p-2",
    },
  ];

  return (
    <div className="w-1/5">
      <div className="border-b pb-4 flex flex-col">
        <h1 className="mb-2">Region</h1>
        {locations.map((location) => (
          <Link
            href={{
              pathname: "/search",
              query: { ...searchParams, city: location.name },
            }}
            key={location.id}
            className="font-light text-reg capitalize"
          >
            {location.name}
          </Link>
        ))}
      </div>
      <div className="border-b pb-4 mt-3 flex flex-col">
        <h1 className="mb-2">Cuisine</h1>
        {cuisines.map((cuisine) => (
          <Link
            href={{
              pathname: "/search",
              query: { ...searchParams, cuisine: cuisine.name },
            }}
            key={cuisine.id}
            className="font-light text-reg capitalize"
          >
            {cuisine.name}
          </Link>
        ))}
      </div>
      <div className="mt-3 pb-4">
        <h1 className="mb-2">Price</h1>
        <div className="flex">
          {prices.map(({ price, label, clasName }) => (
            <Link
              href={{
                pathname: "/search",
                query: { ...searchParams, price },
              }}
              className={clasName}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
