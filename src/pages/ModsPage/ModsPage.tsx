import "./ModsPage.scss";
import ModsTable from "./ModsTable/ModsTable";




export default function ModsPage() {
    try {
        return (
            <div>
                <header className="header">
                    <div className="header__column  header__column-left" />
                    <div className="header__column  header__column-center">
                        <h1 className="page__title">
                            Mods
                        </h1>
                    </div>
                    <div className="header__column header__column-right">
                        <p className="search">
                            Search for mods
                        </p>
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