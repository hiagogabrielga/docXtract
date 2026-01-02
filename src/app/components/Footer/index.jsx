import styles from "./footer.module.css"
export default function Footer() {
  return (
    <footer>
        <h4 className={styles.footerText}>Desenvolvido por <a className={styles.ancora} href="https://github.com/hiagogabrielga" target="_blank">hiagogabrielga</a></h4>
    </footer>
  );
}