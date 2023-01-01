export class IDGenerator {
  private currentCount = 0

  next() {
    this.currentCount++
    return `new_${this.currentCount}`
  }
}
