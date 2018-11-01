"use strict";
function merge(left, right) {
    let merged = [];
    while (left.length && right.length) {
        merged.push(left[0] <= right[0] ? left[0] : right[0]);
        if (left[0] <= right[0])
            left = left.slice(1);
        if (left[0] > right[0])
            right = right.slice(1);
    }
    if (left.length > 0)
        merged = merged.concat(left);
    if (right.length > 0)
        merged = merged.concat(right);
    return merged;
}
function mergeSort(arr) {
    if (arr.length < 2) {
        return arr;
    }
    const midpoint = Math.floor(arr.length / 2);
    const leftArr = arr.slice(0, midpoint);
    const rightArr = arr.slice(midpoint, arr.length);
    return merge(mergeSort(leftArr), mergeSort(rightArr));
}
function solution(A) {
    // write your code in JavaScript (Node.js 8.9.4)
    const sortedA = mergeSort(A);
    for (let i = 1; i < sortedA.length - 1; i++) {
        if (sortedA[i] - sortedA[i - 1] > 1) {
            return sortedA[i - 1] + 1;
        }
    }
}
const a = [1, 3, 6, 4, 1, 2];
console.log(solution(a));
