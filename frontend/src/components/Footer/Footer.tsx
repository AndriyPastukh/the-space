import '../../pages/MainPage/MainPage.css';

export const Footer = () => {
    // Автоматичне оновлення року
    const currentYear = new Date().getFullYear();

    return (
        <footer>
            © {currentYear} TheSpace. All rights reserved
        </footer>
    );
};
