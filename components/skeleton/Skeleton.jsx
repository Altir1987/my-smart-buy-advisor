import styles from 'components/skeleton/skeleton.module.css'
export default function Skeleton () {
    return (
        <div className={styles.skeletonWrapper}>
            {[1,2,3,4,5].map((_, i) => (
                <div key={i} className={styles.skeletonMessage}>
                    <div className={styles.skeletonDate}/>
                    <div className={styles.skeletonContent}/>
                </div>
            ))}
        </div>
    )
}