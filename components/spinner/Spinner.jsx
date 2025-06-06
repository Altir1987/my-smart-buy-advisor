
import styles from './Spinner.module.css'

export default function Spinner({message}) {
    return(
        <div className={styles.container}>
            <div className={styles.spinner}></div>
            <span>{message}</span>
        </div>
    )
}