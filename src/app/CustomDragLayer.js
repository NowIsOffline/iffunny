import { useDragLayer } from 'react-dnd';

const layerStyles = {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 100,
    left: 0,
    top: 0,
};

const getItemStyles = (initialOffset, currentOffset) => {
    if (!initialOffset || !currentOffset) return { display: 'none' };
    const { x, y } = currentOffset;
    const transform = `translate(${x}px, ${y}px)`;
    return {
        transform,
        WebkitTransform: transform,
    };
};

export default function CustomDragLayer() {
    const {
        isDragging,
        item,
        initialOffset,
        currentOffset,
    } = useDragLayer((monitor) => ({
        item: monitor.getItem(),
        initialOffset: monitor.getInitialSourceClientOffset(),
        currentOffset: monitor.getSourceClientOffset(),
        isDragging: monitor.isDragging(),
    }));

    if (!isDragging || !item) return null;

    return (
        <div style={layerStyles}>
            <div style={getItemStyles(initialOffset, currentOffset)}>
                <img src={item.logo || '/icon/robot.png'} alt="" className="w-10 h-10 rounded-xl shadow" />
            </div>
        </div>
    );
}
