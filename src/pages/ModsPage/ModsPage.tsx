import "./ModsPage.scss";
import { ModsTable } from "./ModsTable/ModsTable";




export function ModsPage() {
    try {
        return (
            <div className="page">
                <header className="page-header">
                    <div className="header__column  header__column-center">
                        <h1 className="page__title">
                            Mods
                        </h1>
                    </div>
                    <div className="header__column header__column-right">
                        <div className="search">
                            Search for mods
                        </div>
                    </div>
                </header>
                <ModsTable />
            </div>
        );
    }
    catch (error) {
        return (
            <div>
                Something Broke
            </div>
        );
    }
}