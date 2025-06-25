
import styles from './spinner.module.css'

export default function Spinner({message}) {
    return(
        <div className={styles.container}>
            <div className={styles.spinner}></div>
            <span className={styles.message}>{message}</span>
        </div>
    )
}