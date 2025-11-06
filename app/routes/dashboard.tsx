import type { Route } from "./+types/dashboard";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Dashboard" },
        { name: "description", content: "Dashboard" },
    ];
}

export default function Dashboard({ }: Route.ComponentProps) {
    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold">dashboard</h1>
        </div>
    );
}

