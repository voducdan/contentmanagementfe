export default function TabPaneContent(props) {
    console.log(props)
    const { key } = props;
    return (
        <p>{key}</p>
    )
}