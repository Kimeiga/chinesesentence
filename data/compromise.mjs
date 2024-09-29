import nlp from 'compromise'

let doc = nlp('she sells seashells by the seashore.')

doc.verbs().toPastTense()
doc.text()

console.log(doc.text())

let doc2 = nlp('who')

console.log(doc2.verbs().toInfinitive().text())

console.log(doc2.out('tags'))

doc2.out('tags')